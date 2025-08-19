import {UsersService} from "../domain/users-service";
import {Request, Response} from "express";
import {PaginationQuery, UserInputModel} from "../types/types";
import { injectable} from "inversify";
import { matchedData } from 'express-validator';


@injectable()
export class UserController {

    constructor( protected usersService: UsersService) {
    }
    async getUsers(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection } = matchedData(req, {
            locations: ['query'],
            includeOptionals: true }) as PaginationQuery;

        const { searchLoginTerm, searchEmailTerm } = req.query;

        const users = await this.usersService.getUsers({
            searchLoginTerm: searchLoginTerm as string,
            searchEmailTerm: searchEmailTerm as string,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
        });

        return res.status(200).json(users);
    }
    async createUser(req: Request, res: Response) {
        const userDTO: UserInputModel = req.body;

        const newUser = await this.usersService.createUser(userDTO);

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