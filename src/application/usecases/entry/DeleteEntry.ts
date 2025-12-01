import { IEntryRepository } from '../../../domain/repositories/IEntryRepository';
import { EntryId } from '../../../domain/valueObjects/EntryId';

export interface DeleteEntryDTO {
  entryId: string;
}

export interface DeleteEntryResult {
  success: boolean;
}

/**
 * Use case for deleting an entry
 * Validates entry exists before deletion
 */
export class DeleteEntry {
  constructor(private readonly entryRepository: IEntryRepository) {}

  async execute(dto: DeleteEntryDTO): Promise<DeleteEntryResult> {
    // Validate entry ID is not empty
    if (!dto.entryId || dto.entryId.trim() === '') {
      throw new Error('Entry ID cannot be empty');
    }

    // Check if entry exists
    const entryId = new EntryId(dto.entryId);
    const entry = await this.entryRepository.findById(entryId);
    if (!entry) {
      throw new Error('Entry not found');
    }

    // Delete the entry
    await this.entryRepository.delete(entryId);

    return {
      success: true,
    };
  }
}
