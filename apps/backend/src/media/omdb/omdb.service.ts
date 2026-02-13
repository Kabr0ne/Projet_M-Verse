import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OmdbService {
    private readonly apiKey = process.env.OMDB_API_KEY;
    private readonly apiUrl = 'http://www.omdbapi.com/';

    constructor(private readonly httpService: HttpService) {}

    async searchOMDB(title: string) {
        const url = `${this.apiUrl}?s=${title}&apikey=${this.apiKey}`;
        const { data } = await firstValueFrom(this.httpService.get(url));
        
        return data.Search.map(movie => ({
            externalId: movie.imdbID,
            provider: 'OMDB',
            type: 'MOVIE',
            title: movie.Title,
            posterUrl: movie.Poster,
        }));
    }
}
