import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth/auth.interceptor'; // <-- import your interceptor

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]), // <-- register the interceptor
      withFetch()
    ),
  ],
}).catch(err => console.error(err));