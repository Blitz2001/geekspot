import {
    Laptop, Monitor, Cpu, HardDrive, MemoryStick, Keyboard, Mouse,
    Headphones, Smartphone, Tablet, Watch, Camera, Speaker, Wifi,
    Printer, Gamepad, Tv, Battery, Cable, Server, Box
} from 'lucide-react';

export const iconMap = {
    Laptop,
    Monitor,
    Cpu,
    HardDrive,
    MemoryStick,
    Keyboard,
    Mouse,
    Headphones,
    Smartphone,
    Tablet,
    Watch,
    Camera,
    Speaker,
    Wifi,
    Printer,
    Gamepad,
    Tv,
    Battery,
    Cable,
    Server,
    Box
};

export const iconList = Object.keys(iconMap);

export const getIconComponent = (iconName) => {
    return iconMap[iconName] || Box;
};
