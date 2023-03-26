-- Create syntax for TABLE 'address'
CREATE TABLE `address` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `areaStr` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `cityStr` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `linkMan` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `mobile` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `provinceId` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `provinceStr` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `districtId` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL DEFAULT '0',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `cityId` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'amount'
CREATE TABLE `amount` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `balance` int(11) NOT NULL DEFAULT '0',
  `freeze` int(11) NOT NULL DEFAULT '0',
  `fxCommisionPaying` int(11) NOT NULL DEFAULT '0',
  `growth` int(11) NOT NULL DEFAULT '0',
  `score` int(11) NOT NULL DEFAULT '0',
  `scoreLastRound` int(11) NOT NULL DEFAULT '0',
  `totalPayAmount` int(11) NOT NULL DEFAULT '0',
  `totalPayNumber` int(11) NOT NULL DEFAULT '0',
  `totalScore` int(11) NOT NULL DEFAULT '0',
  `totalWithdraw` int(11) NOT NULL DEFAULT '0',
  `totleConsumed` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'banner'
CREATE TABLE `banner` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `linkUrl` varchar(255) NOT NULL DEFAULT '',
  `paixu` int(11) NOT NULL DEFAULT '0',
  `picUrl` varchar(255) NOT NULL DEFAULT '',
  `remark` varchar(255) NOT NULL DEFAULT '',
  `title` varchar(255) NOT NULL DEFAULT '',
  `type` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'category'
CREATE TABLE `category` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `isUse` tinyint(1) NOT NULL DEFAULT '1',
  `name` varchar(255) NOT NULL DEFAULT '',
  `paixu` int(11) NOT NULL DEFAULT '0',
  `pid` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'childscurgoods'
CREATE TABLE `childscurgoods` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `propertyId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'goods'
CREATE TABLE `goods` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `categoryId` int(11) NOT NULL DEFAULT '0',
  `pic` varchar(255) NOT NULL DEFAULT '',
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `originalPrice` int(11) NOT NULL DEFAULT '0',
  `minPrice` int(11) NOT NULL DEFAULT '0',
  `recommendStatus` tinyint(1) NOT NULL DEFAULT '0',
  `content` longtext CHARACTER SET utf8 NOT NULL,
  `characteristic` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `stores` int(11) NOT NULL DEFAULT '0',
  `feeType` int(11) NOT NULL DEFAULT '0',
  `isFree` tinyint(1) NOT NULL DEFAULT '0',
  `logisticsId` int(11) NOT NULL DEFAULT '0',
  `afterSale` varchar(50) NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'level'
CREATE TABLE `level` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `dateAdd` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateUpdate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `defValidityUnit` int(11) NOT NULL DEFAULT '0',
  `level` int(11) NOT NULL DEFAULT '1',
  `paixu` int(11) NOT NULL DEFAULT '0',
  `rebate` int(11) NOT NULL DEFAULT '0',
  `sendPerMonthScore` int(11) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT '0',
  `upgradePayNumber` int(11) NOT NULL DEFAULT '0',
  `upgradeScore` int(11) NOT NULL DEFAULT '0',
  `upgradeSendScore` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'logistics'
CREATE TABLE `logistics` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `linkMan` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `mobile` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `provinceId` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `districtId` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  `orderId` int(11) NOT NULL DEFAULT '0',
  `cityId` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'logs'
CREATE TABLE `logs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'orderinfo'
CREATE TABLE `orderinfo` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(50) NOT NULL,
  `remark` varchar(255) CHARACTER SET utf8 NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `amountReal` int(11) NOT NULL DEFAULT '0',
  `amount` int(11) NOT NULL DEFAULT '0',
  `dateAdd` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `goodsNumber` int(11) NOT NULL,
  `refundStatus` int(11) NOT NULL DEFAULT '0',
  `isNeedLogistics` tinyint(1) NOT NULL DEFAULT '0',
  `closeMinute` int(11) NOT NULL DEFAULT '60',
  `userId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'orderitem'
CREATE TABLE `orderitem` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) NOT NULL DEFAULT '0',
  `number` int(11) NOT NULL DEFAULT '0',
  `propertyChildIds` varchar(11) NOT NULL DEFAULT '',
  `property` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `orderId` int(11) NOT NULL DEFAULT '0',
  `amountSingle` int(11) NOT NULL DEFAULT '0',
  `goodsName` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `pic` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'pics'
CREATE TABLE `pics` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) NOT NULL DEFAULT '0',
  `pic` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'properties'
CREATE TABLE `properties` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'reputations'
CREATE TABLE `reputations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) NOT NULL DEFAULT '0',
  `orderId` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL DEFAULT '0',
  `reputation` int(11) NOT NULL DEFAULT '0',
  `remark` varchar(255) CHARACTER SET utf8 NOT NULL,
  `dateAdd` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'shoppingcart'
CREATE TABLE `shoppingcart` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) DEFAULT '0',
  `number` int(11) DEFAULT '0',
  `sku` varchar(255) CHARACTER SET utf8 DEFAULT '',
  `userId` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'skulist'
CREATE TABLE `skulist` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) DEFAULT '0',
  `originalPrice` int(11) NOT NULL DEFAULT '0',
  `pingtuanPrice` int(11) NOT NULL DEFAULT '0',
  `price` int(11) NOT NULL DEFAULT '0',
  `score` int(11) NOT NULL DEFAULT '0',
  `stores` int(11) NOT NULL DEFAULT '0',
  `propertyChildIds` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'user'
CREATE TABLE `user` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(60) NOT NULL DEFAULT '',
  `password` varchar(32) NOT NULL DEFAULT '',
  `gender` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `birthday` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `register_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_login_ip` varchar(255) NOT NULL DEFAULT '',
  `nickname` varchar(60) NOT NULL DEFAULT '',
  `mobile` varchar(20) NOT NULL,
  `register_ip` varchar(255) NOT NULL DEFAULT '',
  `avatar` varchar(255) NOT NULL DEFAULT '',
  `weixin_openid` varchar(50) NOT NULL DEFAULT '',
  `province` varchar(50) NOT NULL DEFAULT '',
  `city` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;