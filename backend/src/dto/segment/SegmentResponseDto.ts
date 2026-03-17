export class SegmentResponseDto {
  id!: number;
  label!: string;
  measurement!: number;
  surfaceType!: 'floor' | 'ceiling';
  createdAt!: string;
}
