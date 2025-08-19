import { randomUUID } from 'crypto';
import { add } from 'date-fns';

export class EmailConfirmation {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;

    constructor(data: {
        confirmationCode: string | null;
        expirationDate: Date | null;
        isConfirmed: boolean;
    }) {
        this.confirmationCode = data.confirmationCode;
        this.expirationDate = data.expirationDate;
        this.isConfirmed = data.isConfirmed;
    }
}
export class EmailConfirmationFactory {
    static create(): EmailConfirmation {
        return new EmailConfirmation({
            confirmationCode: randomUUID(),
            expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
            isConfirmed: false
        });
    }

    static createDefault(): EmailConfirmation {
        return new EmailConfirmation({
            confirmationCode: null,
            expirationDate: null,
            isConfirmed: true
        });
    }
}