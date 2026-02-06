import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {StateService} from 'src/app/modules/shared/services/state.service';
import {WhereConfig} from 'src/framework/repository/api/config-list.model';
import {ToastController} from '@ionic/angular';


@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  public queryList: WhereConfig[];

  public prevScrollY = 0;
  public plate: string = '';
  public publicMode: boolean = false;

  constructor(private _stateService: StateService,
              private _toast: ToastController,
              private _http: HttpClient,
              public router: Router) {
  }

  ngOnInit(): void {
    this.queryList = [
      {
        field: 'isFeatured',
        operation: '==',
        value: true
      }
    ];

    this._verifyPublicMode();
  }

  ionViewWillEnter() {
    this._stateService.changeBackState(false);
  }

  onScroll(event: any) {
    const scrollY = event.detail.scrollTop;
    const direction = scrollY > this.prevScrollY ? 'down' : 'up';
    this.prevScrollY = scrollY;

    if (direction === 'up') {
      this._stateService.changeTabState(false);
    } else {
      this._stateService.changeTabState(true);
    }
  }

  public hideEvents(): void {
    const elements: any = document.getElementsByClassName('event-home');

    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.toggle('hidden');
    }
  }

  public verifyTaxi() {
    const formData = new FormData();
    const headers = new HttpHeaders();
    const url = 'https://registrovehicular.cochabamba.bo/web-conductor';

    formData.append('placa', this.plate);
    
    this._http.post(url, formData, { headers }).subscribe(
      (data: any) => {
        this.plate = '';
        
        let state = data.status? 'success' : 'danger';

        this._presentToast(data.mensaje, state);
      },
      error => {
        console.error(error);
      }
    );
  }

  private async _presentToast(message: string, color: string) {
    const toast = await this._toast.create({
      message: message,
      position: 'top',
      duration: 4000,
      color: color
    });
    await toast.present();
  }

  private _verifyPublicMode() {
    if ((localStorage.getItem('publicMode') === 'true')) {
      this.publicMode = true;
    } else {
      this.publicMode = false;
    }
  }
}
