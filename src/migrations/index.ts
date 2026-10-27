import * as migration_20260925_173147 from './20260925_173147';
import * as migration_20261008_023720_cms_integration from './20261008_023720_cms_integration';
import * as migration_20261026_155041 from './20261026_155041';
import * as migration_20261027_020524_case_study_sections from './20261027_020524_case_study_sections';
import * as migration_20261027_201525_work_page_controls from './20261027_201525_work_page_controls';
import * as migration_20261027_210950_remove_work_board_title from './20261027_210950_remove_work_board_title';
import * as migration_20261027_213115_remove_work_intro_pill from './20261027_213115_remove_work_intro_pill';

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
    name: '20261027_020524_case_study_sections',
  },
  {
    up: migration_20261027_201525_work_page_controls.up,
    down: migration_20261027_201525_work_page_controls.down,
    name: '20261027_201525_work_page_controls',
  },
  {
    up: migration_20261027_210950_remove_work_board_title.up,
    down: migration_20261027_210950_remove_work_board_title.down,
    name: '20261027_210950_remove_work_board_title',
  },
  {
    up: migration_20261027_213115_remove_work_intro_pill.up,
    down: migration_20261027_213115_remove_work_intro_pill.down,
    name: '20261027_213115_remove_work_intro_pill'
  },
];
