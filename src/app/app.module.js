"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var angular2_jwt_1 = require("angular2-jwt");
var app_component_1 = require("./app.component");
var app_routes_1 = require("./app.routes");
// >>>>>>>>>> About Quiz >>>>>>>>>>
var home_component_1 = require("./components/quiz/home/home.component");
var add_component_1 = require("./components/quiz/add/add.component");
var add_generalinfo_component_1 = require("./components/quiz/add/add.generalinfo.component");
var add_questionsanswers_component_1 = require("./components/quiz/add/add.questionsanswers.component");
var play_component_1 = require("./components/quiz/play/play.component");
var play_question_component_1 = require("./components/quiz/play/play-question.component");
var play_checkanswers_component_1 = require("./components/quiz/play/play-checkanswers.component");
var quizadd_service_1 = require("./services/quiz/quizadd.service");
var quizplay_service_1 = require("./services/quiz/quizplay.service");
var auth_service_1 = require("./services/auth.service");
// <<<<<<<<<< End of About Quiz <<<<<<<<<<
var book_service_1 = require("./services/book/book.service");
var glossary_service_1 = require("./services/glossary/glossary.service");
// >>>>>>>>>> About Books >>>>>>>>>>
var book_home_component_1 = require("./components/books/book.home.component");
var book_edit_component_1 = require("./components/books/book.edit.component");
var book_search_component_1 = require("./components/books/book.search.component");
// <<<<<<<<<< End of About Books <<<<<<<<<<
// >>>>>>>>>> About Home >>>>>>>>>>
var home_component_2 = require("./components/home/home.component");
// <<<<<<<<<< End of About Home <<<<<<<<<<
// >>>>>>>>>> About Library >>>>>>>>>>
var library_search_component_1 = require("./components/library/library.search.component");
var navbar_component_1 = require("./components/navbar/navbar.component");
// <<<<<<<<<< End of About Library <<<<<<<<<<
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, app_routes_1.routing, forms_1.FormsModule, http_1.HttpModule],
        declarations: [app_component_1.AppComponent,
            //  >>>>>>>>>> About Quiz >>>>>>>>>>
            home_component_1.QuizHomeComponent,
            add_component_1.QuizAddComponent,
            play_component_1.QuizPlayComponent,
            add_generalinfo_component_1.GeneralInfo,
            add_questionsanswers_component_1.QuestionInfo,
            play_question_component_1.QuizQuestionComponent,
            play_checkanswers_component_1.QuizCheckAnswersComponent,
            // <<<<<<<<<< End of About Quiz <<<<<<<<<<
            // >>>>>>>>>> About Books >>>>>>>>>>
            book_home_component_1.BookHomeComponent,
            book_edit_component_1.BookEditComponent,
            book_search_component_1.BookSearchComponent,
            // <<<<<<<<<< End of About Books <<<<<<<<<<
            // >>>>>>>>>> About Home >>>>>>>>>>
            home_component_2.Home,
            // <<<<<<<<<< End of About Home <<<<<<<<<<
            // >>>>>>>>>> About Library >>>>>>>>>>
            navbar_component_1.DeweyNavbarComponent,
            library_search_component_1.LibrarySearchComponent
        ],
        providers: [
            quizadd_service_1.AddService,
            quizplay_service_1.PlayService,
            book_service_1.BookService,
            glossary_service_1.GlossaryService,
            auth_service_1.Auth,
            angular2_jwt_1.AUTH_PROVIDERS
        ],
        bootstrap: [app_component_1.AppComponent]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map