import {
  OrpSearchItem,
  OrpSearchResponse,
  SearchResponseDto,
} from '../../search/entities/search-response.dto';
import * as R from 'ramda';

export type FilteredOrpSearchItemForApi = Omit<
  OrpSearchItem,
  'uri' | 'documentFormat' | 'documentTypeId' | 'regulatorId'
>;

export type FilteredSearchResponseForApi = Omit<
  SearchResponseDto,
  'regulatoryMaterial'
> & {
  regulatoryMaterial: Omit<OrpSearchResponse, 'documents'> & {
    documents: FilteredOrpSearchItemForApi[];
  };
};

export default (
  apiSearch: SearchResponseDto,
): FilteredSearchResponseForApi => ({
  ...apiSearch,
  regulatoryMaterial: toApiRegulatorMaterial(apiSearch.regulatoryMaterial),
});

export const toApiRegulatorMaterial = (
  regMat: OrpSearchResponse,
): FilteredSearchResponseForApi['regulatoryMaterial'] => ({
  ...regMat,
  documents:
    regMat.documents.map<FilteredOrpSearchItemForApi>(toApiOrpDocument),
});

export const toApiOrpDocument = (
  doc: OrpSearchItem,
): FilteredOrpSearchItemForApi =>
  R.omit(['uri', 'documentFormat', 'documentTypeId', 'regulatorId'], doc);
