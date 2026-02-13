import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
    private readonly apiKey = process.env.TMDB_API_READONLY;
    private readonly apiUrl = 'https://api.themoviedb.org/3/';

    constructor(private readonly httpService: HttpService) {}

    private get headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json;charset=utf-8',
        };
    }

    async searchMovies(query: string) {
        const url = `${this.apiUrl}search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=null`;
        const { data } = await firstValueFrom(
            this.httpService.get(url, { headers: this.headers }),
        );
        return data.results.map((movie) => ({
            externalId: movie.id,
            provider: 'TMDB',
            type: 'MOVIE',
            title: movie.title,
            posterUrl: movie.poster_path,
        }));
    }
}
