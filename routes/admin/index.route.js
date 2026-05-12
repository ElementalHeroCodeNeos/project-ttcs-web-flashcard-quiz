const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const dashboardRoutes = require('./dashboard.route');
const userRoutes = require('./user.route');
const deckRoutes = require('./deck.route');
const categoryRoutes = require('./category.route');

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

router.use('/dashboard', authMiddleware.verifyToken('admin'), dashboardRoutes);
router.use('/user', authMiddleware.verifyToken('admin'), userRoutes);
router.use('/deck', authMiddleware.verifyToken('admin'), deckRoutes);
router.use('/category', authMiddleware.verifyToken('admin'), categoryRoutes);

module.exports = router;
