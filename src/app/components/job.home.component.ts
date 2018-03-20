import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { JobService } from '../services/job.service';

@Component({
    moduleId: module.id,
    selector: 'job-home',
    templateUrl: `./job.home.component.html`,
})
export class JobHomeComponent {

    constructor(private _jobService: JobService, private router: Router) {
    }
}