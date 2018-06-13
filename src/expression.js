/* based on https://www.barkweb.co.uk/blog/how-to-build-a-calculator-in-javascript */
const operators = ['AND', 'OR', '(', ')'];
const TYPE = {
    op: 'OP',
    val: 'VAL'
};

function wrapToToken(item) {
    return {
        val: item,
        type: operators.includes(item) ? TYPE.op : TYPE.val
    }
}

function createTokens(expression) {
    const array = expression.split(/\s+|(?=\(|\))|\b/);
    return array.map(wrapToToken);
}

function infixToRPN(tokens) {
    const queue = [];
    const stack = [];
    const precedence = {
        '(': 10,
        'AND': 30,
        'OR': 20
    };

    while (tokens.length) {
        const token = tokens.shift();
        const tkPrec = precedence[token.val] || 0;
        let stPrec = stack.length ? precedence[stack[stack.length - 1].val] : 0;

        if (token.type === TYPE.op && token.val === ')') {
            let op = null;

            while ((op = stack.pop()).val !== '(') {
                queue.push(op);
            }
        } else if (token.type === TYPE.val) {
            queue.push(token);
        } else if (token.type === TYPE.op && (!stack.length || token.val === '(' || tkPrec > stPrec)) {
            stack.push(token);
        } else {
            while (tkPrec <= stPrec) {
                queue.push(stack.pop());
                stPrec = stack.length ? precedence[stack[stack.length - 1].val] : 0;
            }

            stack.push(token);
        }
    }

    while (stack.length) {
        queue.push(stack.pop());
    }

    return queue;
}

function fillTokens(tokens, data) {
    return tokens.map((item) => {
        if (item.type === TYPE.val) {
            item.res = data[item.val];
            item.val = [item.val];
        }
        return item;
    });
}

function evaluateRPN(tokens) {
    const stack = [];
    let val;

    while (tokens.length) {
        const token = tokens.shift();

        if (token.type === TYPE.val) {
            stack.push(token);
            continue;
        }

        const rhs = stack.pop();
        const lhs = stack.pop();

        switch (token.val) {
            case 'AND':
                stack.push({
                    type: TYPE.val,
                    val: (rhs.res && lhs.res) ? lhs.val.concat(rhs.val) : [],
                    res: rhs.res && lhs.res
                });
                break;
            case 'OR':
                val = [];
                if (lhs.res) {
                    val = lhs.val;
                } else if (rhs.res) {
                    val = rhs.val;
                }

                stack.push({
                    type: TYPE.val,
                    val: val,
                    res: rhs.res || lhs.res
                });
                break;
        }
    }

    return stack.pop();
}

export {
    createTokens,
    infixToRPN,
    fillTokens,
    evaluateRPN,
    wrapToToken
}