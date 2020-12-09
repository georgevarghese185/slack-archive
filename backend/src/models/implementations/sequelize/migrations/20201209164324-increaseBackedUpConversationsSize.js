'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.changeColumn(
                'backups',
                'backed_up_conversations',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                },
                { transaction }
            );
            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.changeColumn(
                'backups',
                'backed_up_conversations',
                {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: false
                },
                { transaction }
            );
            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
};
