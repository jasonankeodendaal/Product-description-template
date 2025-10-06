
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import { XIcon } from './icons/XIcon';
import { SwitchCameraIcon } from './icons/SwitchCameraIcon';
import { RedoIcon } from './icons/RedoIcon';
import { CheckIcon } from './icons/CheckIcon';
import { FlashOnIcon } from './icons/FlashOnIcon';
import { FlashOffIcon } from './icons/FlashOffIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { TimerIcon } from './icons/TimerIcon';
import { GridIcon } from './icons/GridIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

const FILTERS = [
    { name: 'None', css: 'camera-filter-none' },
    { name: 'Vivid', css: 'camera-filter-vivid' },
    { name: 'Vintage', css: 'camera