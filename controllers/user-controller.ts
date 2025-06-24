import {UsersService} from "../src/domain/users-service";
import {Request, Response} from "express";
import {UserInputModel} from "../src/types/types";
import {inject, injectable} from "inversify";

@injectable()
export class UserController {

    constructor( protected usersService: UsersService) {
    }

    async getUsers(req: Request, res: Response) {
        const {searchLoginTerm, searchEmailTerm, sortBy = 'createdAt', sortDirection = 'desc'} = req.query;
        const pageNumber = parseInt(req.query.pageNumber as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

        const users = await this.usersService.getUsers({
            searchLoginTerm: searchLoginTerm as string,
            searchEmailTerm: searchEmailTerm as string,
            sortBy: sortBy as string,
            sortDirection: sortDirection === 'asc' ? 1 : -1,
            pageNumber,
            pageSize,
        });

        return res.status(200).json(users);
    }

    async createUser(req: Request, res: Response) {
        const userData: UserInputModel = req.body;

        const newUser = await this.usersService.createUser(userData);

        if ('errorsMessages' in newUser) {
            return res.status(400).json(newUser);
        }

        return res.status(201).json(newUser);
    }

    async deleteUser(req: Request, res: Response) {
        const userId = req.params.id;

        const isDeleted = await this.usersService.deleteUserById(userId);
        if (!isDeleted) {
            return res.sendStatus(404);
        }

        return res.sendStatus(204);
    }
}