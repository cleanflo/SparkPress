import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IAppConfig {
  env: {
      name: string;
      firebase: FirebaseConfig;
  };
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  static settings: IAppConfig;

  constructor(
    private http: HttpClient
  ) { }

  load() {
    const jsonFile = `assets/config/sparkpress.config.json`;
    return new Promise<IAppConfig>((resolve, reject) => {
        this.http.get<IAppConfig>(jsonFile)
        .subscribe(response => {
          AppConfigService.settings = response;
          resolve(response);
      }, (err) => {
        console.log('Error: Requesting SparkPress Configuration from assets/config/sparkpress.config.json: ' + err);
        reject(err);
      });
    });
}
}
