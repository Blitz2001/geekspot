import express from 'express';

const router = express.Router();

router.post('/simple', (req, res) => {
    res.json({ message: 'Simple route works!', body: req.body });
});

export default router;
