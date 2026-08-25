"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Home01Icon,
  Location01Icon,
  PlusSignIcon,
  ChampionIcon,
  UserCircleIcon,
  Notification01Icon,
  Search01Icon,
  MapsGlobal01Icon,
  Flag02Icon,
  CheckmarkCircle02Icon,
  Leaf01Icon,
  WeightScale01Icon,
  Clock01Icon,
  Fire02Icon,
  Medal01Icon,
  ZapIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Bookmark01Icon,
  Money01Icon,
  Package01Icon,
  FavouriteIcon,
  UserGroupIcon,
  Camera01Icon,
  InformationCircleIcon,
  SentIcon,
  WarehouseIcon,
  MinusSignIcon,
  Settings01Icon,
  Wallet01Icon,
  GiftIcon,
  Logout01Icon,
  ShoppingBag01Icon,
  SmartPhone01Icon,
  TShirtIcon,
  TransactionHistoryIcon,
  SquareLock01Icon,
  EyeIcon,
  DashboardSquare01Icon,
  ListViewIcon,
  Moon02Icon,
  Sun01Icon,
  Cancel01Icon,
  SparklesIcon,
  AiViewIcon,
  DeliveryBox01Icon,
  Recycle01Icon,
} from "@hugeicons/core-free-icons";

/**
 * Every icon the app uses, keyed by the name the design file uses.
 * Screens reference `<Icon name="..." />` so a swap of icon set is one edit here.
 */
export const icons = {
  home: Home01Icon,
  pin: Location01Icon,
  plus: PlusSignIcon,
  trophy: ChampionIcon,
  user: UserCircleIcon,
  bell: Notification01Icon,
  search: Search01Icon,
  map: MapsGlobal01Icon,
  flag: Flag02Icon,
  check: CheckmarkCircle02Icon,
  leaf: Leaf01Icon,
  scale: WeightScale01Icon,
  clock: Clock01Icon,
  flame: Fire02Icon,
  medal: Medal01Icon,
  zap: ZapIcon,
  back: ArrowLeft01Icon,
  forward: ArrowRight01Icon,
  bookmark: Bookmark01Icon,
  money: Money01Icon,
  package: Package01Icon,
  heart: FavouriteIcon,
  users: UserGroupIcon,
  camera: Camera01Icon,
  info: InformationCircleIcon,
  send: SentIcon,
  warehouse: WarehouseIcon,
  minus: MinusSignIcon,
  settings: Settings01Icon,
  wallet: Wallet01Icon,
  gift: GiftIcon,
  logout: Logout01Icon,
  bag: ShoppingBag01Icon,
  phone: SmartPhone01Icon,
  shirt: TShirtIcon,
  history: TransactionHistoryIcon,
  lock: SquareLock01Icon,
  eye: EyeIcon,
  dashboard: DashboardSquare01Icon,
  list: ListViewIcon,
  moon: Moon02Icon,
  sun: Sun01Icon,
  close: Cancel01Icon,
  sparkles: SparklesIcon,
  scan: AiViewIcon,
  delivery: DeliveryBox01Icon,
  recycle: Recycle01Icon,
} satisfies Record<string, IconSvgElement>;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
