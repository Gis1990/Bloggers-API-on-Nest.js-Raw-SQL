import { CreatedNewUserDto, InputModelForCreatingNewUser } from "../../dtos/users.dto";
import { BanInfoClass, EmailRecoveryCodeClass, UserAccountEmailClass } from "../../schemas/users.schema";
import { UserViewModelClass } from "../../entities/users.entity";
import { UsersRepository } from "../../repositories/users.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersFactory } from "../../factories/users.factory";

export class CreateUserCommand {
    constructor(
        public readonly dto: InputModelForCreatingNewUser,
        public readonly passwordHash: string,
        public readonly emailConfirmation: UserAccountEmailClass,
        public readonly emailRecoveryCodeData: EmailRecoveryCodeClass,
        public readonly banInfo: BanInfoClass,
    ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(private usersRepository: UsersRepository) {}

    async execute(command: CreateUserCommand): Promise<UserViewModelClass> {
        const createdNewUserDto: CreatedNewUserDto = {
            id: Number(new Date()).toString(),
            login: command.dto.login,
            email: command.dto.email,
            passwordHash: command.passwordHash,
            createdAt: new Date(),
            emailRecoveryCode: command.emailRecoveryCodeData,
            loginAttempts: [],
            emailConfirmation: command.emailConfirmation,
            userDevicesData: [],
            currentSession: {
                ip: "ip",
                lastActiveDate: new Date(),
                title: "title",
                deviceId: "deviceId",
            },
            banInfo: command.banInfo,
        };
        const createdUser = await this.usersRepository.createUser(createdNewUserDto);
        return UsersFactory.createUserViewModelClass(createdUser);
    }
}
