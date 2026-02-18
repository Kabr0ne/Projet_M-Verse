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

    async searchTVShows(query: string) {
        const url = `${this.apiUrl}search/tv?query=${encodeURIComponent(query)}&language=null`;
        const { data } = await firstValueFrom(
            this.httpService.get(url, { headers: this.headers }),
        );
        return data.results.map((show) => ({
            externalId: show.id.toString(),
            provider: 'TMDB',
            type: 'TV_SHOW',
            title: show.name,
            posterUrl: show.poster_path ? `${this.imageBaseUrl}${show.poster_path}` : null,
        }));
    }

    async getTVShowDetails(externalId: string) {
        const url = `${this.apiUrl}tv/${externalId}?language=fr-FR`;
        const { data } = await firstValueFrom(
            this.httpService.get(url, { headers: this.headers }),
        );
        return {
            externalId: data.id.toString(),
            provider: 'TMDB',
            type: 'TV_SHOW',
            title: data.name,
            posterUrl: data.poster_path ? `${this.imageBaseUrl}${data.poster_path}` : null,
            runtime: data.episode_run_time?.[0] || 0,
            genres: data.genres.map((g: any) => g.name).join(', '),
            seasons: data.seasons,
        };
    }


}