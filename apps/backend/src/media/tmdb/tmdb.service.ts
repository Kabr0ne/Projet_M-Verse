import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
    private readonly apiKey = process.env.TMDB_API_READONLY;
    private readonly apiUrl = 'https://api.themoviedb.org/3/';
    private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

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
            externalId: movie.id.toString(),
            provider: 'TMDB',
            type: 'MOVIE',
            title: movie.title,
            posterUrl: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : null,
        }));
    }
    
    async getMovieDetails(externalId: string) {
        const url = `${this.apiUrl}movie/${externalId}?language=null`;
        const { data } = await firstValueFrom(
            this.httpService.get(url, { headers: this.headers }),
        );
        return {
            externalId: data.id.toString(),
            provider: 'TMDB',
            type: 'MOVIE',
            title: data.title,
            posterUrl: data.poster_path ? `${this.imageBaseUrl}${data.poster_path}` : null,
            runtime: data.runtime,
            genres: data.genres.map((g) => g.name).join(', '),
            plot: data.overview,
        };
    }
}
