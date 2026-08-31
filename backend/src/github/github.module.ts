import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { GithubController } from "./github.controller";
import { GithubService } from "./github.service";

@Module({
  imports: [UsersModule],
  controllers: [GithubController],
  providers: [GithubService],
})
export class GithubModule {}
