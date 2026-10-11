import * as migration_20260925_173147 from './20260925_173147';
import * as migration_20261008_023720_cms_integration from './20261008_023720_cms_integration';

export const migrations = [
  {
    up: migration_20260925_173147.up,
    down: migration_20260925_173147.down,
    name: '20260925_173147',
  },
  {
    up: migration_20261008_023720_cms_integration.up,
    down: migration_20261008_023720_cms_integration.down,
    name: '20261008_023720_cms_integration'
  },
];
