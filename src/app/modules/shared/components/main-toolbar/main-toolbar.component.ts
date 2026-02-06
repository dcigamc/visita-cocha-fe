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
    { name: 'English', code: 'en' }
  ];

  public language: any = 'es';

  private _unsubscribe: Subject<void>;
  private _isChangingLang = false;

  constructor(private menu: MenuController,
    public router: Router,
    private _cdr: ChangeDetectorRef,
    public location: Location,
    private _stateService: StateService) {
    this._unsubscribe = new Subject<void>();
    this.backState = false;
  }

  ngOnInit() {
    this.initGoogleTranslate();
    this._initLang();
    this._stateDataListener();
  }

  private _initLang() {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.language = savedLang;
    } else {
      this.language = 'es';
    }

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

  setLang(lang: any) {
    const activeLang = localStorage.getItem('lang_active');
    if (this._isChangingLang || lang?.detail?.value === activeLang) {
      return;
    }

    this._isChangingLang = true;
    this.language = lang?.detail?.value;
    localStorage.setItem('lang', this.language);
    localStorage.setItem('lang_active', this.language);

    if (this.language === 'es') {
      this.resetToOriginalLanguage();
    } else {
      this.applyLang(this.language);
    }

    setTimeout(() => {
      this._isChangingLang = false;
    }, 1500);
  }

  applyLang(lang: string, attempts = 0) {
    if (attempts > 5) return;

    const select = document.querySelector(
      '.goog-te-combo'
    ) as HTMLSelectElement;

    if (!select || select.value === lang) {
      setTimeout(() => this.applyLang(lang, attempts + 1), 500);
      return;
    }

    select.value = lang;
    select.dispatchEvent(new Event('change'));
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
