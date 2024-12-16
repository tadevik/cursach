from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from flask_login import login_user, logout_user, current_user, LoginManager, UserMixin
from flask_mysqldb import MySQL
import os
from werkzeug.utils import secure_filename
from mutagen.mp3 import MP3

def mutagen_length(path):
    try:
        audio = MP3(path)
        length = audio.info.length
        return length
    except:
        return None

# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)

app.secret_key = '7d84a5b926ef5cf82c01dedb8d43433e96d9c09e9a9ad395782206374a95fc97'

login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin):
    def __init__(self, name, id, u_type):
        self.name = name
        self.id = id
        self.type = u_type

    def is_anonymous(self):
        return False

    def is_authenticated(self):
        return True
    
    def is_admin(self):
        return self.u_type == 0

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '911488'
app.config['MYSQL_DB'] = 'qa'
app.config['UPLOAD_FOLDER'] = 'C:\\Users\\User\\cursach\\public'
mysql = MySQL(app)

@login_manager.user_loader
def load_user(user_id):
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id))
    account = cursor.fetchone()
    if account:
        return User(account[1], account[0], account[4])
    else:
        return None

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})

@app.route('/login', methods = ['POST'])
@cross_origin()
def login():
    if request.method == 'POST':
        data = request.json
        username = data.get('name')
        password = data.get('pass')

        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE name = %s AND pass = %s', (username, password,))
        account = cursor.fetchone()

        if account:
            user = User(account[1], account[0], account[4])
            login_user(user)
            id = account[0]
            worker = account[3]
            type = account[4]
            return jsonify({'status': True, 'id': id, 'worker': worker, 'type': type})
        else:
            return jsonify({'status': False})
    else:
        return jsonify({'status': False})

@app.route('/logout', methods = ['POST'])
@cross_origin()
def logout():
    if request.method == 'POST':
        logout_user()
        return jsonify({'status': True})
    else:
        return jsonify({'status': False})

@app.route('/register', methods = ['POST'])
@cross_origin()
def register():
    if request.method == 'POST':
        data = request.json
        username = data.get('name')
        password = data.get('pass')
        worker = data.get('worker')

        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT id FROM users WHERE name = %s', [username])
        account = cursor.fetchone()
        if (account):
            return jsonify({'status': False})

        cursor.execute('INSERT INTO users (name, pass, worker, type) VALUES (%s, %s, %s, %s)', (username, password, worker, 1))
        con.commit()

        cursor.execute('SELECT id FROM users WHERE name = %s and pass = %s', (username, password))
        account = cursor.fetchone()

        if account:
            id = account[0]
            return jsonify({'status': True, 'id': id})
        else:
            return jsonify({'status': False})
    else:
        return jsonify({'status': False})

@app.route('/worker', methods = ['GET', 'POST'])
@cross_origin()
def worker():
    if request.method == 'POST':
        data = request.json

        con = mysql.connect
        cursor = con.cursor()

        cursor.execute('INSERT INTO workers (name, role, depart) VALUES (%s, %s, %s)', (data['name'], data['role'], data['depart']))
        con.commit()

        cursor.execute('SELECT id FROM workers WHERE name = %s AND role = %s', (data['name'], data['role']))
        account = cursor.fetchone()

        if account:
            id = account[0]
            return jsonify({'status': True, 'id': id})
        else:
            return jsonify({'status': False})
        
    elif request.method == 'GET':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT * FROM workers')
        worker_list = cursor.fetchall()
        if worker_list:
            return jsonify({'workers': worker_list})
        else:
            return jsonify({'workers': []})

    else:
        return jsonify({'status': False})
@app.route('/worker/<int:id>', methods = ['POST', 'DELETE'], endpoint='worker_id')
@cross_origin()
def worker(id):
    if request.method == 'POST':
        data = request.json

        con = mysql.connect
        cursor = con.cursor()

        cursor.execute('UPDATE workers SET name=%s, role=%s, depart=%s WHERE id=%s', 
                       (data['name'], data['role'], data['depart'], id))
        con.commit()
        return jsonify({'status': True})
    elif request.method == 'DELETE':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('UPDATE records SET worker_id = null WHERE worker_id = %s', [id])
        con.commit()
        cursor.execute('DELETE FROM comments WHERE author = %s', [id])
        con.commit()
        cursor.execute('DELETE FROM workers WHERE id = %s', [id])
        con.commit()
        return jsonify({'status': True})
    else:
        return jsonify({'status': False})

@app.route('/depart', methods = ['GET', 'POST'])
@cross_origin()
def depart():
    if request.method == 'POST':
        data = request.json

        con = mysql.connect
        cursor = con.cursor()

        cursor.execute('INSERT INTO departs (name) VALUES (%s)', [data['name']])
        con.commit()

        cursor.execute('SELECT id FROM departs WHERE name = %s', [data['name']])
        account = cursor.fetchone()

        if account:
            id = account[0]
            return jsonify({'status': True, 'id': id})
        else:
            return jsonify({'status': False})
        
    elif request.method == 'GET':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT * FROM departs')
        depart_list = cursor.fetchall()
        if depart_list:
            return jsonify({'departs': depart_list})
        else:
            return jsonify({'departs': []})

    else:
        return jsonify({'status': False})
@app.route('/depart/<int:id>', methods = ['POST', 'DELETE'], endpoint='depart_id')
@cross_origin()
def depart_id(id):
    if request.method == 'POST':
        data = request.json

        con = mysql.connect
        cursor = con.cursor()

        cursor.execute('UPDATE departs SET name = %s WHERE id = %s', [data['name'], data['id']])
        con.commit()
        return jsonify({'status': True})
    
    else:
        return jsonify({'status': False})


@app.route('/param', methods = ['GET', 'POST'])
@cross_origin()
def param():
    if request.method == 'POST':
        data = request.json
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('INSERT INTO params (name, weight, type) VALUES (%s, %s, %s)', [data['name'], data['weight'], data['type']])
        con.commit()
        cursor.execute('SELECT id FROM params WHERE name = %s AND weight = %s', [data['name'], data['weight']])
        account = cursor.fetchone()
        if account:
            id = account[0]
            return jsonify({'status': True, 'id': id})
        else:
            return jsonify({'status': False})
        
    elif request.method == 'GET':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT * FROM params')
        param_list = cursor.fetchall()
        if param_list:
            return jsonify({'params': param_list})
        else:
            return jsonify({'params': []})

    else:
        return jsonify({'status': False})
@app.route('/param/<int:id>', methods = ['POST'], endpoint='param_id')
@cross_origin()
def param_id(id):
    if request.method == 'POST':
        data = request.json

        con = mysql.connect
        cursor = con.cursor()

        cursor.execute('UPDATE params SET name = %s, weight = %s, type = %s WHERE id = %s', 
                       [data['name'], data['weight'], data['type'], data['id']])
        con.commit()
        return jsonify({'status': True})
    
    else:
        return jsonify({'status': False})

@app.route('/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'status': False})
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': False})
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify({'status': True})

@app.route('/record', methods = ['GET', 'POST'])
@cross_origin()
def record():
    if request.method == 'POST':
        data = request.json
        con = mysql.connect
        cursor = con.cursor()
        rec_length = str(mutagen_length(data['record']))
        cursor.execute('INSERT INTO records (id, record, cust_num, worker_id, time, length, status, type) \
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)', 
                       [data['id'], data['record'], data['cust_num'], data['worker_id'], data['time'], rec_length,
                        data['status'], data['type']])
        con.commit()
        cursor.execute('SELECT id FROM records WHERE cust_num = %s AND time = %s', [data['cust_num'], data['time']])
        account = cursor.fetchone()
        if account:
            id = account[0]
            return jsonify({'status': True, 'id': id})
        else:
            return jsonify({'status': False})
        
    elif request.method == 'GET':
        if current_user.is_admin() != True:
            return jsonify({'status': False})
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT * FROM records')
        record_list = cursor.fetchall()
        if record_list:
            ratings = {}
            comments = {}
            for result in record_list:
                cursor.execute('SELECT * FROM ratings WHERE record = %s', [result[0]])
                ratings[result[0]] = cursor.fetchall()
                cursor.execute('SELECT * FROM comments WHERE record = %s', [result[0]])
                comments[result[0]] = cursor.fetchall()
            return jsonify({'records': record_list, 'ratings': ratings, 'comments': comments})
        else:
            return jsonify({'records': []})

    else:
        return jsonify({'status': False})
    


@app.route('/record/<int:id>', methods = ['GET', 'DELETE'], endpoint='record_id')
@cross_origin()
def record(id):
    if request.method == 'GET':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT * FROM users WHERE id = %s AND type = 0', [id])
        user = cursor.fetchone()
        if(user):
            cursor = con.cursor()
            cursor.execute('SELECT * FROM records')
        else:
            cursor = con.cursor()
            cursor.execute('SELECT * FROM records WHERE user_id = %s OR status = 2', [id])
        record_list = cursor.fetchall()
        if record_list:
            ratings = {}
            comments = {}
            for result in record_list:
                cursor.execute('SELECT * FROM ratings WHERE record = %s', [result[0]])
                ratings[result[0]] = cursor.fetchall()
                cursor.execute('SELECT * FROM comments WHERE record = %s', [result[0]])
                comments[result[0]] = cursor.fetchall()
            return jsonify({'records': record_list, 'ratings': ratings, 'comments': comments})
        else:
            return jsonify({'records': []})
    elif request.method == 'DELETE':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('DELETE FROM comments WHERE record = %s', [id])
        con.commit()
        cursor.execute('DELETE FROM ratings WHERE record = %s', [id])
        con.commit()
        cursor.execute('DELETE FROM records WHERE id = %s', [id])
        con.commit()
        return jsonify({'status': True})
    else:
        return jsonify({'status': False})
    
@app.route('/rate', methods = ['POST'])
@cross_origin()
def rate():
    if request.method == 'POST':
        data = request.json
        con = mysql.connect
        cursor = con.cursor()
        for i in data['ratings']:
            cursor.execute('INSERT INTO ratings VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE \
                            rating = (%s);', [data['ratings'][i], data['id'], i, data['ratings'][i]])
        con.commit()
        return jsonify({'status': True})
    
    else:
        return jsonify({'status': False})

@app.route('/comment', methods = ['POST'])
@cross_origin()
def comment():
    if request.method == 'POST':
        data = request.json
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('INSERT INTO comments (record, author, comment, type, time, date) \
                        VALUES (%s, %s, %s, %s, %s, %s);', 
                        [data['id'], 
                        data['comments']['author'],
                        data['comments']['comment'],
                        data['comments']['type'],
                        data['comments']['time'],
                        data['comments']['date'],
                        ])
        con.commit()
        cursor.execute('SELECT id FROM comments WHERE record = %s AND date = %s', 
                       [data['id'], data['comments']['date']])
        id_comment = cursor.fetchone()
        return jsonify({'status': True, 'id': id_comment})
    
    else:
        return jsonify({'status': False})

@app.route('/comment/<int:id>', methods = ['POST', 'DELETE'], endpoint='comment_id')
@cross_origin()
def comment_id(id):
    if request.method == 'POST':
        data = request.json
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('UPDATE comments SET \
                       comment = %s, time = %s, date = %s WHERE id = %s;', 
                        [
                        data['comments']['comment'],
                        data['comments']['time'],
                        data['comments']['date'],
                        id
                        ])
        con.commit()
        return jsonify({'status': True})
    
    elif request.method == 'DELETE':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('DELETE FROM comments WHERE id = %s', [id])
        con.commit()
        return jsonify({'status': True})

    else:
        return jsonify({'status': False})

@app.route('/archive', methods = ['POST'])
@cross_origin()
def archive():
    if request.method == 'POST':
        data = request.json
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('UPDATE records SET status = 2 WHERE id = %s', [data['id']])
        con.commit()
        return jsonify({'status': True})
    
    else:
        return jsonify({'status': False})
    

@app.route('/user', methods = ['GET'])
@cross_origin()
def user():
    if request.method == 'GET':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT * FROM users')
        user_list = cursor.fetchall()
        if user_list:
            return jsonify({'users': user_list})
        else:
            return jsonify({'users': []})

    else:
        return jsonify({'status': False})

@app.route('/user/<int:id>', methods = ['POST', 'DELETE'], endpoint='user_id')
@cross_origin()
def user_id(id):
    if request.method == 'POST':
        data = request.json
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('UPDATE users SET name = %s, pass = %s, worker = %s WHERE id = %s',
                       [data['name'], data['password'], data['worker'], id])
        con.commit()
        return jsonify({'status': True})
    elif request.method == 'DELETE':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('UPDATE records SET user_id = null WHERE user_id = %s', [id])
        con.commit()
        cursor.execute('DELETE FROM comments WHERE author = %s', [id])
        con.commit()
        cursor.execute('DELETE FROM workers WHERE id = %s', [id])
        con.commit()
        return jsonify({'status': True})
    else:
        return jsonify({'status': False})


@app.route('/distribute', methods=['GET'])
def distribute():
    if request.method == 'GET':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT * FROM records WHERE status = 0')
        record_list = cursor.fetchall()
        for result in record_list:
            cursor.execute('select user_id, count(*) as count_user\
            from (\
            select users.id user_id from users LEFT JOIN records\
            on users.id = records.user_id \
            WHERE (records.type <> 2 OR records.type IS NULL) AND users.type = 1\
            ) a\
            group by user_id\
            having user_id IS NOT NULL\
            order by count_user asc\
            limit 1;')
            temp_work = cursor.fetchone()
            cursor.execute('UPDATE records SET status = 1, user_id = %s WHERE status = 0 LIMIT 1', [temp_work[0]])
        con.commit()
        return jsonify({'status': 'true'})
    else:
        return jsonify({'status': 'false'})

@app.route('/get_avg/<int:id>', methods = ['GET'])
@cross_origin()
def get_avg(id):
    if request.method == 'GET':
        con = mysql.connect
        cursor = con.cursor()
        cursor.execute('SELECT AVG(rating) FROM ratings WHERE param = %s', [id])
        avg_rate = cursor.fetchone()
        if avg_rate:
            return jsonify({'rate': avg_rate[0]})
        else:
            return jsonify({'rate': 0})
    else:
        return jsonify({'status': False})


if __name__ == '__main__':
    app.run(host='localhost', port=5000)