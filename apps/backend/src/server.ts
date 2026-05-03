import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { setupSocketIO } from './socket';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRoutes);

const { io, botService } = setupSocketIO(server);

io.on('connection', (socket: any) => {
  socket.on('register:bot', () => {
    console.log('Bot registration received');
    botService.registerBot(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
