import {Router} from 'express';
import {handleValidationErrors, paginationValidationRules, validateUserInput} from '../validation/express-validator';
import {basicAuthMiddleware} from '../validation/basicAuthMiddleware';
import {userController} from "../composition-root";

export const usersRouter = Router();

usersRouter.get('/', basicAuthMiddleware, paginationValidationRules, userController.getUsers.bind(userController));
usersRouter.post('/', basicAuthMiddleware, validateUserInput, handleValidationErrors, userController.createUser.bind(userController));
usersRouter.delete('/:id', basicAuthMiddleware, userController.deleteUser.bind(userController));
