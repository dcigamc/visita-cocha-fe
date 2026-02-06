import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { StateService } from '../../services/state.service';

declare global {
  interface Window {
    googleTranslateElementInit: any;
    google: any;
  }
}
@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss'],
})
export class MainToolbarComponent implements OnInit {

  public backState: boolean;
  public languages = [
    { name: 'Español', code: 'es' },
    { name: 'English', code: 'en' },
    { name: 'Français', code: 'fr' },
    { name: 'Italiano', code: 'it' },
    { name: 'Português', code: 'pt' }
  ];

  public language: any = 'es';

  private _unsubscribe: Subject<void>;

  constructor(private menu: MenuController,
    public router: Router,
    private _cdr: ChangeDetectorRef,
    public location: Location,
    private _stateService: StateService) {
    this._unsubscribe = new Subject<void>();
    this.backState = false;
  }

  ngOnInit() {
    this._initLang();
    this._stateDataListener();
  }

  private _initLang() {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.language = savedLang;
    }

    this.initGoogleTranslate();

    if (this.language !== 'es') {
      setTimeout(() => {
        this.applyLang(this.language);
      }, 1500);
    }
  }

  initGoogleTranslate() {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'es',
          includedLanguages: 'en,fr,it,pt',
          autoDisplay: false
        },
        'google_translate_element'
      );
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }
  }

  setLang(event: any) {
    const lang = event?.detail?.value || event?.value || event;

    if (!lang || lang === this.language && localStorage.getItem('lang') === lang) {
      return;
    }

    this.language = lang;
    localStorage.setItem('lang', lang);

    if (lang === 'es') {
      this.resetToOriginalLanguage();
      return;
    }

    setTimeout(() => {
      this.applyLang(lang);
    }, 300);
  }

  applyLang(lang: string) {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;

    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    } else {
      console.warn('Google Translate no detectado, reintentando...');
      setTimeout(() => this.applyLang(lang), 1000);
    }
  }

  resetToOriginalLanguage() {
    document.cookie =
      'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    document.cookie =
      'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' +
      window.location.hostname +
      ';';

    localStorage.setItem('lang', 'es');

    location.reload();
  }

  openSideBar(id: string) {
    this.menu.open(id);
  }

  private _stateDataListener(): void {
    this._stateService.stateModelListener()
      .pipe(
        takeUntil(this._unsubscribe)
      )
      .subscribe((backState: any) => {
        this.backState = backState;

        this._cdr.markForCheck();
      });
  }
}
