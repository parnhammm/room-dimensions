import { WallSummaryResponseDto } from './WallSummaryResponseDto';
import { WindowResponseDto } from '../window/WindowResponseDto';

export class WallDetailResponseDto extends WallSummaryResponseDto {
  windows!: WindowResponseDto[];
}
