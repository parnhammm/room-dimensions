# Quickstart: Overhaul Release Cleanup

**Branch**: `003-overhaul-cleanup` | **Date**: 2026-03-17

Integration and acceptance test scenarios for each user story.

---

## US1 — Test Run Isolation

**Prerequisite**: Both `docker-compose.yml` (port 3306, `room_dimensions`) and
`docker-compose.test.yml` (port 3307, `room_dimensions_test`) are running.

### Scenario 1: Dev database is untouched after a test run

```bash
# Capture current room count in dev DB before test run
BEFORE=$(mysql -h 127.0.0.1 -P 3306 -u root -ppassword room_dimensions \
  -sNe "SELECT COUNT(*) FROM room;")

# Run full test suite
cd backend && npm test

# Capture room count after test run
AFTER=$(mysql -h 127.0.0.1 -P 3306 -u root -ppassword room_dimensions \
  -sNe "SELECT COUNT(*) FROM room;")

# Assert: counts must be equal
[ "$BEFORE" -eq "$AFTER" ] && echo "PASS: dev DB untouched" || echo "FAIL"
```

### Scenario 2: Consecutive runs produce consistent results

```bash
cd backend && npm test 2>&1 | grep -E "Tests:|passed|failed" > run1.txt
npm test 2>&1 | grep -E "Tests:|passed|failed" > run2.txt
diff run1.txt run2.txt && echo "PASS: runs are consistent" || echo "FAIL: runs differ"
```

### Scenario 3: Interrupted run leaves dev DB clean

```bash
# Start test suite and kill mid-run
npm test &
TEST_PID=$!
sleep 5
kill -9 $TEST_PID

# Re-run from the start — setup must clean test DB even after abrupt kill
npm test

# Dev DB must still be clean
COUNT=$(mysql -h 127.0.0.1 -P 3306 -u root -ppassword room_dimensions \
  -sNe "SELECT COUNT(*) FROM room;")
[ "$COUNT" -eq 0 ] && echo "PASS" || echo "FAIL: dev DB has $COUNT rows"
```

---

## US2 — Segment Width and Length

### Scenario 1: Create segment with all four fields

```bash
# Create a room first
ROOM=$(curl -s -X POST http://localhost:4000/api/v1/rooms \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Room","floor":"Ground"}' | jq .id)

# Create segment with width and length
SEG=$(curl -s -X POST http://localhost:4000/api/v1/rooms/$ROOM/segments \
  -H 'Content-Type: application/json' \
  -d '{"label":"Main","measurement":12.5,"surfaceType":"floor","width":3.0,"length":2.5}')

echo $SEG | jq .
# Expected: id, label="Main", measurement=12.5, width=3.0, length=2.5
```

### Scenario 2: Update only width — other fields unchanged

```bash
SEG_ID=$(echo $SEG | jq .id)
UPDATED=$(curl -s -X PATCH \
  http://localhost:4000/api/v1/rooms/$ROOM/segments/$SEG_ID \
  -H 'Content-Type: application/json' \
  -d '{"width":3.2}')

echo $UPDATED | jq '{width, length, measurement}'
# Expected: width=3.2, length=2.5, measurement=12.5
```

### Scenario 3: Segment without width/length saves correctly

```bash
curl -s -X POST http://localhost:4000/api/v1/rooms/$ROOM/segments \
  -H 'Content-Type: application/json' \
  -d '{"label":"Bay","measurement":2.1,"surfaceType":"floor"}' | jq .
# Expected: width=null, length=null
```

### Scenario 4: Zero or negative width/length is rejected

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:4000/api/v1/rooms/$ROOM/segments \
  -H 'Content-Type: application/json' \
  -d '{"label":"X","measurement":1.0,"surfaceType":"floor","width":-1}'
# Expected: 400
```

### Scenario 5: Print summary includes segment width and length

```bash
curl -s http://localhost:4000/api/v1/rooms/print-summary | \
  jq '.floors[].rooms[].floorSegments[] | select(.label=="Main")'
# Expected: width=3.2, length=2.5 appear in output
```

---

## US3 — Runtime and Container Modernisation

### Scenario 1: Container reports Node 22

```bash
docker build -t room-backend -f backend/Dockerfile .
docker run --rm room-backend node --version
# Expected: v22.x.x
```

### Scenario 2: Non-root user in production container

```bash
docker run --rm --entrypoint whoami room-backend
# Expected: node
```

### Scenario 3: Full stack starts from scratch

```bash
docker compose down -v
docker compose up --build -d
sleep 10
curl -s http://localhost:4000/api/v1/rooms | jq .
# Expected: [] (empty array — server is up)
curl -s http://localhost:3000 | grep -i "room"
# Expected: HTML page loads
```

### Scenario 4: All tests pass under new runtime

```bash
docker run --rm -v $(pwd):/app -w /app node:22-alpine \
  sh -c "npm ci && npm test"
# Expected: all test suites pass
```

---

## US4 — Test Coverage at 80%

### Scenario 1: Backend coverage report ≥ 80%

```bash
cd backend && npm test -- --coverage 2>&1 | grep -E "Lines|Branches"
# Expected: Both Lines and Branches show ≥ 80%
```

### Scenario 2: Frontend coverage report ≥ 80%

```bash
cd frontend && npm test -- --coverage 2>&1 | grep -E "Lines|Branches"
# Expected: Both Lines and Branches show ≥ 80%
```

### Scenario 3: Coverage gate fails on deliberate gap

```bash
# Add an untested function to a service file
echo "export function deliberateGap() { return 42; }" >> \
  backend/src/services/SettingsService.ts
cd backend && npm test -- --coverage
# Expected: coverage gate FAILS (exits non-zero)

# Restore
git checkout backend/src/services/SettingsService.ts
```

### Scenario 4: Coverage gate passes after restoration

```bash
cd backend && npm test -- --coverage
# Expected: exits 0, coverage ≥ 80%
```
