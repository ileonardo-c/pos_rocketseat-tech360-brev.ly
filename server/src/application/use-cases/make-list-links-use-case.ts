import type { LinkRepository } from "../repositories/link-repository.js";
import { ok } from "../../shared/result.js";

export function makeListLinksUseCase(deps: { linkRepository: LinkRepository }) {
  return {
    async execute() {
      const links = await deps.linkRepository.listAll();
      return ok({ links });
    },
  };
}
