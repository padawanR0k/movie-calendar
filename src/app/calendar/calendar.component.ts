import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { key } from '../../environments/environment.prod';
interface Film {
  movieListResult: {
    totCnt: Number,
    source: string,
    movieList: [
      {
        movieCd: Number,
        movieNm: string,
        movieNmEn: string,
        prdtYear: Number,
        openDt: string,
        typeNm: string,
        prdtStatNm: string,
        nationAlt: string,
        genreAlt: string,
        repNationNm: string,
        repGenreNm: string,
      }
    ]
  };
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class MyCalendarComponent implements OnInit {
  filmList: Array<any>;
  result: Array<any>;
  loading = true;
  constructor(public http: HttpClient) {}

  getFilmList() {
    const params = new HttpParams()
      .set(
        'openStartDt', new Date().getFullYear().toString()
      )
      .set(
        'itemPerPage', '100'
      )
      .set('key', key);
    this.http
      .get<Film>('https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json', { params })
      .subscribe(res => {
          this.filmList = res.movieListResult.movieList
                                                      .filter(film => {
                                                        return !(film.repGenreNm === '성인물(에로)' ||
                                                               film.movieNm.indexOf('무삭제') !== -1 ||
                                                               film.movieNm.indexOf('처제') !== -1 ||
                                                               film.movieNm.indexOf('거유') !== -1 ||
                                                               film.movieNm.indexOf('친구 엄마') !== -1 ||
                                                               film.movieNm.indexOf('친구엄마') !== -1 ||
                                                               film.movieNm.indexOf('야한') !== -1);
                                                      })
                                                      .map(film => {
                                                        const openingDate = film.openDt;
                                                        const year = openingDate.slice(0, 4);
                                                        const month = openingDate.slice(4, 6);
                                                        const day = openingDate.slice(6, 8);
                                                        const date = `${year}-${month}-${day}`;
                                                        return {
                                                          start: date,
                                                          title: film.movieNm,
                                                        };
                                                      });
          console.log(this.filmList);
          this.loading = false;
          const thisMonth = new Date().toISOString().substring(5, 7);
          this.getMonthView(thisMonth);
      });
  }
  getMonthView(month: string) {
    this.result = this.filmList.filter(film => {
      return month === film.start.slice(5, 7);
    });
    this.result.sort((a, b) => {
      const A = parseInt(a.start.slice(8, 10), 10);
      const B = parseInt(b.start.slice(8, 10), 10);
      return (A > B) ? 1 : (A < B) ? - 1 : 0;
    });
    this.result = this.removeOverlap(this.result);

  }

  getRecentMonth(): any[] {
    const currentMoneth = new Date().getMonth() + 1;
    let monthArr = [];
    for (let i = currentMoneth; i < currentMoneth + 3; i++) {
      let month = (i > 12 ? (i - 12) : i).toString();
      month = month.length === 1 ? '0' + month : month;
      monthArr = [...monthArr, month];
    }
    return monthArr;
  }

  getDay(date: string): string {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    const dayList = ['일', '월', '화', '수', '목', '금', '토'];
    const whatDay = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    console.log(`date: ${date}, whatDay: ${whatDay.getDay()} year: ${year}, month: ${month}, day: ${day}`);
    return dayList[whatDay.getDay()];
  }

  getGsearchLink(title: string) {
    return `https://www.google.co.kr/search?q=${title}`;
  }
  getYoutubeLink(title: string) {
    return `https://www.youtube.com/results?search_query=${title}`;
  }

  removeOverlap(array: Array<any>) {
    const openList = [];
    const startList = [];
    array.map((film, index) => {
      if (startList.indexOf(film.start) === -1) {
        startList.push(film.start);
        openList.push({
          start: film.start,
          title: [film.title],
        });
      } else {

        openList[startList.length - 1].title = [...openList[startList.length - 1].title, film.title];
      }
    });
    return openList;
  }
  ngOnInit() {
    this.getFilmList();
  }
}
