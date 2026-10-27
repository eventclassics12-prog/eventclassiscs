import * as migration_20260925_173147 from './20260925_173147';
import * as migration_20261008_023720_cms_integration from './20261008_023720_cms_integration';
import * as migration_20261026_155041 from './20261026_155041';
import * as migration_20261027_020524_case_study_sections from './20261027_020524_case_study_sections';

export const migrations = [
  {
    up: migration_20260925_173147.up,
    down: migration_20260925_173147.down,
    name: '20260925_173147',
  },
  {
    up: migration_20261008_023720_cms_integration.up,
    down: migration_20261008_023720_cms_integration.down,
    name: '20261008_023720_cms_integration',
  },
  {
    up: migration_20261026_155041.up,
    down: migration_20261026_155041.down,
    name: '20261026_155041',
  },
  {
    up: migration_20261027_020524_case_study_sections.up,
    down: migration_20261027_020524_case_study_sections.down,
    name: '20261027_020524_case_study_sections'
  },
];
