### Omit的实现

- 先放上实现的代码，这个网上有很多
```typescript
	type MyOmit<T, K extends keyof T> = {
		[P in keyof T as P extends K ? never : P]: T[P]
	}
```
- 如何使用？
```typescript

	type Person = {
		name: string;
		age: number;
	}

	type onlyAgePerson = MyOmit<Person, 'name'>;

	// 等同于定义了
	type onlyAgePerson = {
		age: number;
	}
```

- Omit类型有2个type parameters：
	- 第一个传入的是参照类型，第二个是忽略或丢弃的参照类型的属性(property)

- 这个实现涉及到了几个关键字 extends，keyof，in，as，以及三元表达式 => （逻辑表达式 ? type A: type B）。

- extends 这里的含义是分配，type A extends type B， 就是type A 分配给 type B。
	- 如果可以被分配，就是逻辑true，能被分配的逻辑就是 type A的property 一定要包含可以分配的 property
	- 如果不能被分配，就是逻辑false

- as，因为有extends的逻辑在，且 P in keyof T 是一个读取T的枚举属性的过程，并不返回确定的值，最后被ts推断为any类型。
	- 也就是说如果不写： as P，那么三元表达式就会被推断为  P in keyof T extends K ? any : any;
	- 那么你写的表达式是  P in keyof T extends K ? never : P，  never是不能被any赋值的，这里产生了约束，（ type never = type any是禁止的，  type any = type never是可以的。）
	- 由此会报循环约束(circyle constraints的错误），个人推断。
	- 至于如何个循环或者（闭环约束），我猜测本来想用never去约束不存在的类型，但是上一个逻辑又用任意类型any去约束never， 必然是无解的。
- 简单写下博客，前因后果也没写太明白，后续慢慢改。
