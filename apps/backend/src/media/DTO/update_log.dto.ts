import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class updateLogDTO {
    @ApiProperty({ description: 'Status of the media (e.g., Watching, Completed)' })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiProperty({ description: 'Incase the user forgot he already watched/played the media' })
    @IsBoolean()
    @IsOptional()
    rewatched?: boolean;

    @ApiProperty({ description: 'If the user liked the media' })
    @IsBoolean()
    @IsOptional()
    liked?: boolean;
    
    @ApiProperty({ description: 'User rating for the media (e.g., 8.5)' })
    @IsNumber()
    @IsOptional()
    rating?: number;

    @ApiProperty({ description: 'User comment about the media' })
    @IsString()
    @IsOptional()
    comment?: string; 

    

}