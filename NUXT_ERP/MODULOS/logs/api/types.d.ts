/**
 * Declaraciones de tipos globales para el sistema de módulos dinámicos de ByteWave
 * 
 * IMPORTANTE: Estas funciones son inyectadas por jiti en el contexto global
 * cuando los módulos son cargados dinámicamente por /server/api/modules/[...].ts
 * (ver líneas 114-119 de ese archivo)
 * 
 * NO SE DEBEN IMPORTAR - Son globales en tiempo de ejecución
 * El mismo patrón se usa en el módulo de facturas que funciona correctamente
 */

declare global {
  /**
   * Define un event handler para H3
   * Inyectado globalmente por jiti en server/api/modules/[...].ts línea 114
   */
  function defineEventHandler<T = any>(handler: (event: any) => T | Promise<T>): any;
  
  /**
   * Establece el código de estado HTTP de la respuesta
   * Inyectado globalmente por jiti en server/api/modules/[...].ts línea 115
   */
  function setResponseStatus(event: any, status: number): void;
  
  /**
   * Obtiene los parámetros de query de la URL
   * Inyectado globalmente por jiti en server/api/modules/[...].ts línea 116
   */
  function getQuery(event: any): Record<string, any>;
  
  /**
   * Obtiene un parámetro de ruta dinámica
   * Inyectado globalmente por jiti en server/api/modules/[...].ts línea 117
   */
  function getRouterParam(event: any, name: string): string | undefined;
  
  /**
   * Lee el body de la petición HTTP
   * Inyectado globalmente por jiti en server/api/modules/[...].ts línea 118
   */
  function readBody<T = any>(event: any): Promise<T>;
  
  /**
   * Obtiene un header específico de la petición
   * Inyectado globalmente por jiti en server/api/modules/[...].ts línea 119
   */
  function getHeader(event: any, name: string): string | undefined;
  
  /**
   * Obtiene todos los headers de la petición
   * Inyectado globalmente por jiti en server/api/modules/[...].ts línea 120
   */
  function getHeaders(event: any): Record<string, string>;
}

export {};
