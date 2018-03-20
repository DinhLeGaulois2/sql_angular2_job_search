import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: `./app.component.html`,
})
export class AppComponent {

  constructor() {
  }

  refreshPage(): void {
    window.location.reload();
  }
}
