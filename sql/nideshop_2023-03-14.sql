-- Create syntax for TABLE 'address'
CREATE TABLE `address` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL DEFAULT '',
  `areaStr` varchar(255) NOT NULL DEFAULT '',
  `cityStr` varchar(255) NOT NULL DEFAULT '',
  `linkMan` varchar(255) NOT NULL DEFAULT '',
  `mobile` varchar(255) NOT NULL DEFAULT '',
  `provinceId` varchar(255) NOT NULL DEFAULT '',
  `provinceStr` varchar(255) NOT NULL DEFAULT '',
  `districtId` varchar(255) NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL DEFAULT '0',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `cityId` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'banner'
CREATE TABLE `banner` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `linkUrl` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `paixu` int(11) NOT NULL DEFAULT '0',
  `picUrl` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `remark` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `title` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `type` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'cashlog'
CREATE TABLE `cashlog` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `dateAdd` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `behavior` int(11) NOT NULL DEFAULT '0',
  `orderId` varchar(50) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `type` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL DEFAULT '0',
  `amount` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'category'
CREATE TABLE `category` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `isUse` tinyint(1) NOT NULL DEFAULT '1',
  `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `paixu` int(11) NOT NULL DEFAULT '0',
  `pid` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'childscurgoods'
CREATE TABLE `childscurgoods` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `propertyId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'goods'
CREATE TABLE `goods` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `categoryId` int(11) NOT NULL DEFAULT '0',
  `pic` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `originalPrice` int(11) NOT NULL DEFAULT '0',
  `minPrice` int(11) NOT NULL DEFAULT '0',
  `recommendStatus` tinyint(1) NOT NULL DEFAULT '0',
  `content` longtext CHARACTER SET utf8mb4,
  `characteristic` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `stores` int(11) NOT NULL DEFAULT '0',
  `feeType` int(11) NOT NULL DEFAULT '0',
  `isFree` tinyint(1) NOT NULL DEFAULT '0',
  `logisticsId` int(11) NOT NULL DEFAULT '0',
  `afterSale` varchar(50) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'logistics'
CREATE TABLE `logistics` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `linkMan` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `mobile` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `provinceId` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `districtId` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `status` int(11) NOT NULL DEFAULT '0',
  `orderId` int(11) NOT NULL DEFAULT '0',
  `cityId` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `trackingNumber` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `shipperName` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'orderinfo'
CREATE TABLE `orderinfo` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `amountReal` int(11) NOT NULL DEFAULT '0',
  `amount` int(11) NOT NULL DEFAULT '0',
  `dateAdd` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `goodsNumber` int(11) NOT NULL,
  `refundStatus` int(11) NOT NULL DEFAULT '0',
  `isNeedLogistics` tinyint(1) NOT NULL DEFAULT '0',
  `closeMinute` int(11) NOT NULL DEFAULT '60',
  `userId` int(11) NOT NULL DEFAULT '0',
  `isPay` tinyint(1) NOT NULL DEFAULT '0',
  `amountLogistics` int(11) NOT NULL DEFAULT '0',
  `balanceSwitch` varchar(10) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `wxPayData` varchar(1000) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'orderitem'
CREATE TABLE `orderitem` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) NOT NULL DEFAULT '0',
  `number` int(11) NOT NULL DEFAULT '0',
  `propertyChildIds` varchar(11) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `property` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `orderId` int(11) NOT NULL DEFAULT '0',
  `amountSingle` int(11) NOT NULL DEFAULT '0',
  `goodsName` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `pic` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'pics'
CREATE TABLE `pics` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) NOT NULL DEFAULT '0',
  `pic` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'properties'
CREATE TABLE `properties` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'reputations'
CREATE TABLE `reputations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) NOT NULL DEFAULT '0',
  `orderId` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL DEFAULT '0',
  `reputation` int(11) NOT NULL DEFAULT '0',
  `remark` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
  `dateAdd` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'shoppingcart'
CREATE TABLE `shoppingcart` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) DEFAULT '0',
  `number` int(11) DEFAULT '0',
  `sku` varchar(255) CHARACTER SET utf8mb4 DEFAULT '',
  `userId` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4;

-- Create syntax for TABLE 'shortlink'
CREATE TABLE `shortlink` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
  `link` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'skulist'
CREATE TABLE `skulist` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `goodsId` int(11) DEFAULT '0',
  `originalPrice` int(11) NOT NULL DEFAULT '0',
  `pingtuanPrice` int(11) NOT NULL DEFAULT '0',
  `price` int(11) NOT NULL DEFAULT '0',
  `score` int(11) NOT NULL DEFAULT '0',
  `stores` int(11) NOT NULL DEFAULT '0',
  `propertyChildIds` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

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
  `mobile` varchar(20) NOT NULL DEFAULT '',
  `register_ip` varchar(255) NOT NULL DEFAULT '',
  `avatar` varchar(255) NOT NULL DEFAULT '',
  `weixin_openid` varchar(50) NOT NULL DEFAULT '',
  `province` varchar(50) NOT NULL DEFAULT '',
  `city` varchar(50) NOT NULL DEFAULT '',
  `type` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;


INSERT INTO `goods` (`id`, `categoryId`, `pic`, `name`, `originalPrice`, `minPrice`, `recommendStatus`, `content`, `characteristic`, `stores`, `feeType`, `isFree`, `logisticsId`, `afterSale`, `status`)
VALUES
	(19, 4, 'https://timg01.bdimg.com/timg?pacompress&imgtype=1&sec=1439619614&autorotate=1&di=4e310e105a46a21e2f21fc5e526721b1&quality=100&size=b870_10000&src=http%3A%2F%2Fpic.rmb.bdstatic.com%2Fedee74b967f903aa02da0db34bd619c3.jpeg', '无情两份可乐', 2323, 5, 1, '32232', 'characteristic', 111, 0, 1, 2, '1,2,3', 0),
	(21, 4, 'https://img.zcool.cn/community/012a5c5c74acf7a801203d226c61d0.jpg@1280w_1l_2o_100sh.jpg', '3232', 2323, 4, 1, '32232', 'characteristic', 104, 0, 1, 2, '1,2,3', 0);

INSERT INTO `banner` (`id`, `linkUrl`, `paixu`, `picUrl`, `remark`, `title`, `type`)
VALUES
	(1, 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzg3MzI2NDcwNw==', 0, 'https://cdn.it120.cc/apifactory/2019/06/18/4c458676-85bb-4271-91a6-79ed9fc47545.jpg', '', 't', 'indexBanner'),
	(2, 'https://gitee.com/joeshu/v-shop', 1, 'https://cdn.it120.cc/apifactory/2019/06/18/4c458676-85bb-4271-91a6-79ed9fc47545.jpg', '', 't', 'indexBanner'),
	(3, 'https://gitee.com/joeshu/v-shop', 2, 'https://cdn.it120.cc/apifactory/2019/06/18/4c458676-85bb-4271-91a6-79ed9fc47545.jpg', '', 't', 'indexBanner'),
	(4, 'https://gitee.com/joeshu/v-shop', 3, 'https://cdn.it120.cc/apifactory/2019/06/18/4c458676-85bb-4271-91a6-79ed9fc47545.jpg', '', 't', 'indexBanner');


INSERT INTO `category` (`id`, `isUse`, `name`, `paixu`, `pid`)
VALUES
	(1, 1, '手机', 2, 1),
	(2, 1, '电话', 1, 2),
	(3, 1, '笔记本', 3, 3),
	(4, 1, '测试', 7, 4),
	(5, 0, '虚拟商品', 4, 5);


INSERT INTO `childscurgoods` (`id`, `name`, `propertyId`)
VALUES
	(1, '红色', 1),
	(2, '蓝色', 1),
	(3, '紫色', 1),
	(4, '1米', 2),
	(5, '3米', 2);


INSERT INTO `pics` (`id`, `goodsId`, `pic`)
VALUES
	(1, 19, 'https://dcdn.it120.cc/2022/02/04/b5017470-29bb-43a3-b34c-56cdf6b0fb05.png'),
	(2, 19, 'https://cdn.it120.cc/apifactory/2019/06/20/6271e429-bd00-4def-8fff-05264e1f26d2.jpg'),
	(3, 19, 'https://cdn.it120.cc/apifactory/2019/06/20/6271e429-bd00-4def-8fff-05264e1f26d2.jpg'),
	(4, 19, 'https://cdn.it120.cc/apifactory/2019/06/20/6271e429-bd00-4def-8fff-05264e1f26d2.jpg'),
	(5, 19, 'https://cdn.it120.cc/apifactory/2019/06/20/6271e429-bd00-4def-8fff-05264e1f26d2.jpg'),
	(6, 19, 'https://cdn.it120.cc/apifactory/2019/06/20/6271e429-bd00-4def-8fff-05264e1f26d2.jpg');


INSERT INTO `properties` (`id`, `name`)
VALUES
	(1, '颜色'),
	(2, '大小');

  INSERT INTO `skulist` (`id`, `goodsId`, `originalPrice`, `pingtuanPrice`, `price`, `score`, `stores`, `propertyChildIds`)
VALUES
	(1, 19, 1, 3, 22, 212, 26, '1:1,2:4'),
	(2, 19, 2, 6, 3, 212, 26, '1:1,2:5'),
	(3, 19, 3, 5, 2, 212, 29, '1:2,2:4'),
	(4, 19, 44, 4, 3232, 212, 24, '1:2,2:5'),
	(5, 19, 22, 3, 2, 212, 0, '1:3,2:5'),
	(6, 19, 212, 2, 2, 212, 27, '1:3,2:4');

