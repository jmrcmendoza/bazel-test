import request from 'supertest';

export default request(`localhost:${process.env.HTTP_PORT || 8000}`);
