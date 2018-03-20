import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { routes } from './app.routes';

import { AppComponent } from './app.component';
import { JobHomeComponent } from './components/job.home.component';
import { JobAddComponent } from './components/job.add.component';
import { JobShowComponent } from './components/job.show.component';

import { JobService } from './services/job.service';

@NgModule({
  imports: [BrowserModule, routes, FormsModule, HttpModule],
  declarations: [
    AppComponent,
    JobHomeComponent,
    JobAddComponent,
    JobShowComponent
  ],
  providers: [ JobService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
