import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Staff Management API',
      version: '1.0.0',
      description: 'API documentation for Staff Management System',
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
}; 