import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';


interface Film {
  movieListResult: {
    totCnt: Number,
    source: String,
    movieList: [
      {
        movieCd: Number,
        movieNm: String,
        movieNmEn: String,
        prdtYear: Number,
        openDt: Number,
        typeNm: String,
        prdtStatNm: String,
        nationAlt: String,
        genreAlt: String,
        repNationNm: String,
        repGenreNm: String,
      }
    ]
  };
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  filmList: Array<any>;
  result: Array<any>;
  constructor(public http: HttpClient) { }

  getFilmList() {
    const params = new HttpParams()
      .set(
        'openStartDt', '2018'
      )
      .set(
        'itemPerPage', '1000'
      )
      .set('key', 'db372cfbe5c5f2db5e92aed3ff92f3cb');
    this.http
      .get<Film>('http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json', { params })
      .subscribe(res => {
          this.filmList = res.movieListResult.movieList.map(film => {
            return {
              openDate: film.openDt,
              movName: film.movieNm
            };
          });
      });
  }
  ngOnInit() {
    this.getFilmList()
  }

  getMonthView(month: number) {
    this.result = this.filmList.filter(film => {
      return month === film.openDate.slice(4, 6);
    });
  }

}
