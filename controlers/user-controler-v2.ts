import sqlite3 from "sqlite3";

const db = new sqlite3.Database('./anash-test.db');
const MIN_ITEMS_TO_SELECT = 'id, salutation, full_name_search, father_name, husband_mobile, home_phone, city, street, building_number, entrance_number, apartment_number, neighborhood, synagogue';


const getItemsToDisplay = (isAdmin: string) => {
    const isAdminBoolean = isAdmin === "true";
    console.log('isAdmin', isAdmin, typeof isAdmin, isAdminBoolean);
    return isAdminBoolean ?
        '*' :
        `id, salutation, first_name, last_name, father_name, full_name_search, wife_name, is_groom_of_rabbi, 
    children_at_home_count, has_married_children, city, street, building_number, apartment_number, 
    entrance_number, neighborhood, synagogue, home_phone, husband_mobile, wife_mobile, whatsapp_number, husband_name, husband_father_name, email_1`;
}

const getUsers = async (req: any, res: any) => {
    db.all(`SELECT ${MIN_ITEMS_TO_SELECT} FROM users`, (err: any, rows: any) => {
        if (err) {
            throw err;
        }
        res.send(rows);
    });
}

const getUserById = async (req: any, res: any) => {
    const { isAdmin } = req.query;
    db.get(`SELECT ${getItemsToDisplay(isAdmin)} FROM users WHERE id = ?`, [req.params.id], (err: any, row: any) => {
        if (err) {
            throw err;
        }
        res.send(row);
    });
}


const getUserByFullName = async (req: any, res: any) => {
    const { fullname, shul, city } = req.query;
    const names = fullname.split(" ");
    let sqlQuery = `SELECT ${MIN_ITEMS_TO_SELECT} FROM users WHERE full_name_search LIKE ? AND (synagogue LIKE ? OR synagogue IS NULL)`;
    for (let i = 1; i < names.length; i++) {
        sqlQuery += ` AND full_name_search LIKE ?`;
    }
    if (city === 'אחר') {
        sqlQuery += ` AND city NOT IN ('ירושלים', 'מודיעין עילית', 'ביתר עילית', 'בני ברק', 'טבריה', 'גבעת זאב')`;
    } else {
        sqlQuery += ` AND city LIKE ?`;
    }
    const sqlParams = names.map((name: string) => `%${name}%`);
    sqlParams.push(`%${shul || ''}%`);
    if (city !== 'אחר') {
        sqlParams.push(`%${city || ''}%`);
    }
    console.log('sqlParams', sqlParams);
    console.log('sqlQuery', sqlQuery);

    db.all(
        sqlQuery,
        sqlParams,
        (err, rows) => {
            if (err) {
                throw err;
            }
            res.send(rows);
        });
}


const getUserByPhoneNumber = async (req: any, res: any) => {
    const { number, shul, city } = req.query;
    let sqlQuery = `SELECT ${MIN_ITEMS_TO_SELECT} FROM users WHERE (home_phone LIKE ? OR husband_mobile LIKE ? OR wife_mobile LIKE ? OR whatsapp_number LIKE ? OR system_phone_1 LIKE ? OR system_phone_2 LIKE ?) AND (synagogue LIKE ? OR synagogue IS NULL)`;
    if (city === 'אחר') {
        sqlQuery += ` AND city NOT IN ('ירושלים', 'מודיעין עילית', 'ביתר עילית', 'בני ברק', 'טבריה', 'גבעת זאב')`;
    } else {
        sqlQuery += ` AND (city LIKE ? OR city IS NULL)`;
    }
    const sqlParams = [
        `%${number}%`, `%${number}%`, `%${number}%`, `%${number}%`, `%${number}%`, `%${number}%`, `%${shul || ''}%`
    ];
    if (city && city !== 'אחר') {
        sqlParams.push(`%${city}%`);
    }
    db.all(
        sqlQuery,
        sqlParams,
        (err, rows) => {
            if (err) {
                throw err;
            }
            res.send(rows);
        });
}

const getUsersByPlace = async (req: any, res: any, next: any) => {
    const { shul, city } = req.query;
    let sqlQuery = `SELECT ${MIN_ITEMS_TO_SELECT} FROM users WHERE synagogue LIKE ?`;
    const sqlParams = [`%${shul || ''}%`];
    if (city && city !== 'אחר') {
        sqlQuery += ` AND city LIKE ?`;
        sqlParams.push(`%${city}%`);
    } else if (city === 'אחר') {
        sqlQuery += ` AND city NOT IN ('ירושלים', 'מודיעין עילית', 'ביתר עילית', 'בני ברק', 'טבריה', 'גבעת זאב')`;
    }
    db.all(
        sqlQuery,
        sqlParams,
        (err, rows) => {
            if (err) {
                throw err;
            }
            res.send(rows);
        });
}

export { getUsers, getUserById, getUserByFullName, getUserByPhoneNumber, getUsersByPlace }