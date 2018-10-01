import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'sp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SparkPress';

  private pagesCollection: AngularFirestoreCollection<SparkPage>;
  private pages: Observable<SparkPage[]>;

  constructor(
    private router: Router,
    // private afs: AngularFirestore
  ) {
    console.log('APP COMPONENT');
    const config = this.router.config;

    // this.pagesCollection = this.afs.collection<SparkPage>('pages', ref =>
    //   ref.where('active', '==', true)
    // );
    // this.pages = this.pagesCollection.valueChanges();
    // this.pages.pipe(take(1)).toPromise().then((pages) => {
    //   pages.forEach((page) => {

    //     // add pages to router config, all pointing to HomePageComponent
    //     config.push({
    //       path: page.route,
    //       component: HomePageComponent,
    //       data: {name: page.name, content: page.content, title: page.title}
    //     });

    //   });
    // }).then(() => {
    //   this.router.resetConfig(config);
    // }).catch((err) => {
    //   console.log('Error recieved when registering pages to router: ', err);
    // });
  }
}

export interface SparkPage {
  active: boolean;
  route: string;
  name: string;
  title: string;
  content: string;
}
