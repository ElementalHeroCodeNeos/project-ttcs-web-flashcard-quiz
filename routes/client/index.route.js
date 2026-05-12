const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const dashboardRoutes = require('./dashboard.route');
const deckRoutes = require('./deck.route');
const exploreRoutes = require('./explore.route');
const profileRoutes = require('./profile.route');

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

router.use('/dashboard', authMiddleware.verifyToken(), dashboardRoutes);
router.use('/deck', authMiddleware.verifyToken(), deckRoutes);
router.use('/explore', exploreRoutes);
router.use('/profile', authMiddleware.verifyToken(), profileRoutes);

module.exports = router;
