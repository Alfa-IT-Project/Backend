import { Router } from 'express';
var router = Router();

/* GET customers listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

export default router;