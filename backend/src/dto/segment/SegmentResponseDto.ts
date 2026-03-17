export class SegmentResponseDto {
  id!: number;
  label!: string;
  measurement!: number;
  width!: number | null;
  length!: number | null;
  surfaceType!: 'floor' | 'ceiling';
  createdAt!: string;
}
