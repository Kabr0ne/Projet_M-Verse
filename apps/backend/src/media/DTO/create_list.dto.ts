import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class createListDTO {
    @ApiProperty({ example: 'My Favorite Movies', description: 'Name of the list' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'A list of my all-time favorite movies', description: 'Description of the list' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: false, description: 'Whether the list is public or private' })
    @IsOptional()
    @IsBoolean()
    isPublic: boolean;
}