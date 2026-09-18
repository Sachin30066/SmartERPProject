import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'smart-erp';

  searchText: string = '';
  isListening: boolean = false;

  private recognition: any = null;

  menuList = [
    {
      name: 'Dashboard',
      keywords: ['dashboard', 'home'],
      route: '/dashboard',
      icon: '▦'
    },
    {
      name: 'Items',
      keywords: ['items', 'item', 'products', 'product'],
      route: '/items',
      icon: '▤'
    },
    {
      name: 'Purchase',
      keywords: ['purchase', 'purchases', 'buy', 'buying'],
      route: '/purchase',
      icon: '🛒'
    },
    {
      name: 'Stock Issue',
      keywords: ['stock issue', 'stock', 'issue', 'stockissue'],
      route: '/stock-issue',
      icon: '📦'
    }
  ];

  constructor(
    private router: Router
  ) {}


  // ==============================
  // SEARCH
  // ==============================

  onSearch() {

    const search = this.searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return;
    }

    const result = this.menuList.find(menu => {

      if (menu.name.toLowerCase() === search) {
        return true;
      }

      return menu.keywords.some(keyword =>
        keyword.toLowerCase() === search
      );

    });

    if (result) {

      this.router.navigate([result.route]);

      this.searchText = '';

      return;
    }

    console.log('No menu found:', search);
  }


  // ==============================
  // VOICE SEARCH
  // ==============================

  startVoiceSearch() {

    // Agar already listening hai
    // to button stop karega
    if (this.isListening) {

      this.stopVoiceSearch();

      return;
    }


    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;


    if (!SpeechRecognition) {

      alert(
        'Voice search is not supported in this browser.'
      );

      return;
    }


    this.recognition = new SpeechRecognition();

    this.recognition.lang = 'en-IN';

    this.recognition.continuous = true;

    this.recognition.interimResults = true;


    this.isListening = true;


    this.recognition.onresult = (event: any) => {

      let transcript = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript +=
          event.results[i][0].transcript;

      }


      this.searchText =
        transcript.trim();


      console.log(
        'Voice Search:',
        this.searchText
      );


      // Final result milte hi menu search
      const lastResult =
        event.results[event.results.length - 1];


      if (
        lastResult &&
        lastResult.isFinal
      ) {

        this.onSearch();

      }

    };


    this.recognition.onerror = (event: any) => {

      console.log(
        'Voice Error:',
        event.error
      );

      this.isListening = false;

    };


    this.recognition.onend = () => {

      this.isListening = false;

    };


    this.recognition.start();

  }


  // ==============================
  // STOP VOICE SEARCH
  // ==============================

  stopVoiceSearch() {

    if (this.recognition) {

      this.recognition.stop();

      this.recognition = null;

    }

    this.isListening = false;

  }


  // ==============================
  // SEARCH RESULT
  // ==============================

  get searchResults() {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {
      return [];
    }

    return this.menuList.filter(menu => {

      return (
        menu.name
          .toLowerCase()
          .includes(search)
        ||
        menu.keywords.some(keyword =>
          keyword
            .toLowerCase()
            .includes(search)
        )
      );

    });

  }


  openSearchResult(menu: any) {

    this.router.navigate([
      menu.route
    ]);

    this.searchText = '';

  }

}