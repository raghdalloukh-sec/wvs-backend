import { ScanModule } from './types';
import { httpHeadersModule } from './modules/httpHeaders.module';
import { sslTlsModule } from './modules/sslTls.module';
import { cookiesModule } from './modules/cookies.module';
import { corsModule } from './modules/cors.module';
import { clickjackingModule } from './modules/clickjacking.module';

export const scanModules: ScanModule[] = [
  httpHeadersModule,
  sslTlsModule,
  cookiesModule,
  corsModule,
  clickjackingModule,
];
