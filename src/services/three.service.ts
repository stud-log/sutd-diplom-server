export interface IConeParams {
    radius: number,
    height: number,
    segments: number,
}


export class ThreeService {

    async calculate({radius, height, segments}: IConeParams) {
        const vertices = [];
        const triangles = [];

        const A = { x: 0, y: 0, z: height };
        vertices.push(A);

        for (var i = 0; i < segments; i++) {
            var angle = (2 * Math.PI * i) / segments;
            var x = radius * Math.cos(angle);
            var y = radius * Math.sin(angle);
            var Pi = { x: x, y: y, z: 0 };
            vertices.push(Pi);
        }
        
        for (var i = 1; i <= segments; i++) {
            var triangle = [0, i, (i % segments) + 1];
            triangles.push(triangle[0], triangle[1], triangle[2]);
        }

        // Вычисление единичных нормалей и добавление их к результатам
        const normals = [];
        const centerPoint = { x: 0, y: 0, z: 0 }; // Центр конуса

        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            var normal = {
                x: vertex.x - centerPoint.x,
                y: vertex.y - centerPoint.y,
                z: vertex.z - centerPoint.z
            };

            var length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
            normal.x /= length;
            normal.y /= length;
            normal.z /= length;

            normals.push(normal.x, normal.y, normal.z);
        }

        const remappedVertices: number[] = []
        vertices.forEach(i => {
            remappedVertices.push(i.x, i.y, i.z);
        })

        return { vertices: remappedVertices, triangles, normals };
    }
  
}
